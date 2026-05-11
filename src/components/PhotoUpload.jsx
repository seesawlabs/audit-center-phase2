import { useRef } from 'react';

export default function PhotoUpload({ photos = [], onChange }) {
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;
    Promise.all(
      fileArray.map(file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve({ url: e.target.result, name: file.name });
        reader.readAsDataURL(file);
      }))
    ).then(newPhotos => onChange([...photos, ...newPhotos]));
  };

  return (
    <div>
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative w-16 h-16">
              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover rounded-lg border border-gray-200" />
              <button
                onClick={() => onChange(photos.filter((_, i) => i !== idx))}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => cameraRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
          Take Photo
        </button>
        <button
          onClick={() => galleryRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Upload Photo
        </button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }} />
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
