export const formatReferenceId = (id: string) => {
  if (!id) {
    return id;
  }
  const match = id.match(/^(\d{2})(\d{2})$/);
  if (match) {
    return `${match[1]}회 ${match[2]}번`;
  }
  return id;
};
