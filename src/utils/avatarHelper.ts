export const getLocalAvatarImage = (avatarId: string) => {
  switch(avatarId) {
    case 'classic_goose': return require("../../assets/profilePictures/pp1.png");
    case 'cowboy_goose': return require("../../assets/profilePictures/pp2.png");
    case 'party_goose': return require("../../assets/profilePictures/pp3.png");
    case 'floral_goose': return require("../../assets/profilePictures/pp4.png");
    case 'blossom_goose': return require("../../assets/profilePictures/pp5.png");
    case 'vintage_goose': return require("../../assets/profilePictures/pp6.png");
    default: return require("../../assets/profilePictures/pp1.png");
  }
};