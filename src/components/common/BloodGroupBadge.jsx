export default function BloodGroupBadge({ group, size = 'md' }) {
  const sizeMap = { sm: 'blood-badge-sm', md: '', lg: 'blood-badge-lg' };
  return (
    <div className={`blood-badge ${sizeMap[size]}`} title={`Blood Group: ${group}`}>
      {group}
    </div>
  );
}
