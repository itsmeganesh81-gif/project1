import { useState } from 'react';

export default function Avatar({
  name = '',
  initials,
  avatar,
  image,
  src,
  size = 40,
  className = ''
}) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = avatar || image || src;

  const colors = [
    { bg: '#fee2e2', text: '#D62839' },
    { bg: '#dbeafe', text: '#1d4ed8' },
    { bg: '#d1fae5', text: '#065f46' },
    { bg: '#fef3c7', text: '#92400e' },
    { bg: '#ede9fe', text: '#5b21b6' },
    { bg: '#fce7f3', text: '#9d174d' },
  ];

  const computedInitials = initials || (name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?');
  const idx = (computedInitials?.charCodeAt(0) || 0) % colors.length;
  const color = colors[idx];

  if (photoUrl && !imgError) {
    return (
      <div
        className={`avatar ${className}`}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f1f5f9',
          position: 'relative',
        }}
        title={name}
      >
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        background: color.bg,
        color: color.text,
        fontSize: Math.max(10, size * 0.35),
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        userSelect: 'none',
      }}
      title={name}
    >
      {computedInitials}
    </div>
  );
}
