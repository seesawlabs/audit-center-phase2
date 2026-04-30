import { BIOMED_SECTIONS } from '../data/biomedAudit';

export function getYnQuestionMap() {
  const map = {};
  BIOMED_SECTIONS.forEach(section => {
    section.groups.forEach(group => {
      group.questions.forEach(q => {
        if (q.type === 'yn') map[q.id] = q.text;
      });
    });
  });
  return map;
}

function buildPrompt() {
  const lines = [];
  BIOMED_SECTIONS.forEach(section => {
    section.groups.forEach(group => {
      group.questions.forEach(q => {
        if (q.type === 'yn') lines.push(`${q.id}: ${q.text}`);
      });
    });
  });

  return `This is a printed BioMed audit form filled out by hand. Each Yes/No/N/A question shows a small question ID in gray text, followed by the question, then three checkboxes labeled "Yes", "No", and "N/A". There may also be a dashed comment line beneath each question.

Here are all the Yes/No/N/A questions and their IDs:
${lines.join('\n')}

Examine the form carefully. For each question where you can clearly see a checkbox marked (checked, circled, or crossed), record the answer. If a comment is written on the dashed line beneath a question, include it.

Return ONLY a valid JSON object. Keys are question IDs. Values are "yes", "no", or "na". For comments, use the key format "[qid]_comment".

Example:
{
  "q1": "yes",
  "q2": "no",
  "q2_comment": "Extinguisher tag expired",
  "q3": "na"
}`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function ocrAuditImage(file) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('No API key set. Add VITE_ANTHROPIC_API_KEY to your .env.local file.');

  const base64 = await fileToBase64(file);
  const mediaType = file.type?.startsWith('image/') ? file.type : 'image/jpeg';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-client-side-allow-origin': '*',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: buildPrompt() },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse a response from the API. Try a clearer image.');

  return JSON.parse(jsonMatch[0]);
}
