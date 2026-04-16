interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
}

const Avatar = ({ src, name, size }: AvatarProps) => {
  const dimension = size || 40;
  const fontSize = dimension * 0.35;
  return (
    <div
      className="aspect-square rounded-full overflow-hidden bg-text-primary"
      style={{
        width: dimension,
        height: dimension,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="flex items-center justify-center w-full h-full text-white font-bold font-[cabin]" style={{ fontSize }}>
          {name?.charAt(0)}
        </span>
      )}
    </div>
  );
};

export default Avatar;
