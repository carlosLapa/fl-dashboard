import React, { useEffect, useState } from 'react';
import axios from 'api/apiConfig';

interface UserAvatarProps {
  userId: number;
  name: string;
  size?: number;
  rounded?: boolean;
}

// Deterministic per-name color so the same person always gets the same placeholder color.
const AVATAR_COLORS = [
  '#F87171',
  '#FBBF24',
  '#34D399',
  '#60A5FA',
  '#A78BFA',
  '#F472B6',
  '#4ADE80',
  '#38BDF8',
  '#FB923C',
  '#818CF8',
];

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorForName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// Fetched on demand (and cached by the browser via Cache-Control) instead of being embedded as
// base64 in the users list response. Shows an initials placeholder immediately — both while the
// photo is loading and as the permanent fallback when there is none — so the cell is never blank
// while waiting on the network.
const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  name,
  size,
  rounded = false,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const sizeStyle = size ? { width: `${size}px`, height: `${size}px` } : {};

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
        // No image (404) or failed to load — keep showing the initials placeholder.
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

  // The 25% left margin centers the avatar within a wider table cell — only relevant when no
  // explicit size is given (the table-row use case); sized instances (navbar, page headers) sit
  // in their own container and shouldn't inherit that offset.
  const imgStyle = {
    ...sizeStyle,
    ...(size ? {} : { marginLeft: '25%' }),
    ...(rounded ? { borderRadius: '50%' } : {}),
  };

  if (imageUrl) {
    return (
      <div className="profile-image-cell">
        <img src={imageUrl} alt={name} className="profile-image" style={imgStyle} />
      </div>
    );
  }

  return (
    <div className="profile-image-cell">
      <div
        className="profile-image profile-image-placeholder"
        style={{
          ...imgStyle,
          backgroundColor: getColorForName(name),
        }}
        aria-label={name}
      >
        {getInitials(name)}
      </div>
    </div>
  );
};

export default UserAvatar;
