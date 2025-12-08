import texts from "../../assets/texts.json";

export const formatReferenceId = (id: string) => {
  if (!id) {
    return id;
  }
  const match = id.match(/^(\d{2})(\d{2})$/);
  if (match) {
    return `${match[1]}${texts.componentContents.countTimes} ${match[2]}${texts.componentContents.questionNumber}`;
  }
  return id;
};
