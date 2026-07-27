import React, { useEffect, useState } from 'react';
import axios from 'api/apiConfig';

interface UserAvatarProps {
  userId: number;
  name: string;
}

// Fetched on demand (and cached by the browser via Cache-Control) instead of being embedded as
// base64 in the users list response, which used to ship every visible avatar on every page load.
const UserAvatar: React.FC<UserAvatarProps> = ({ userId, name }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const loadImage = async () => {
      try {
        const response = await axios.get(`/users/${userId}/profile-image`, {
          responseType: 'blob',
        });
        if (!cancelled) {
          objectUrl = URL.createObjectURL(response.data);
          setImageUrl(objectUrl);
        }
      } catch {
        // No image (404) or failed to load — fall back to the "Sem imagem" placeholder.
        if (!cancelled) {
          setImageUrl(null);
        }
      }
    };

    loadImage();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [userId]);

  if (!imageUrl) {
    return <span>Sem imagem</span>;
  }

  return (
    <div className="profile-image-cell">
      <img
        src={imageUrl}
        alt={name}
        className="profile-image"
        style={{
          maxWidth: '90px',
          maxHeight: '90px',
          marginLeft: '25%',
        }}
      />
    </div>
  );
};

export default UserAvatar;
