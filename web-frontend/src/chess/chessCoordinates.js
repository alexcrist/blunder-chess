export const getFileAndRankIndices = (coordinate) => {
    const [file, rank] = coordinate;
    const fileIndex = file.charCodeAt(0) - "a".charCodeAt(0);
    const rankIndex = Number(rank) - 1;
    return [fileIndex, rankIndex];
};

export const getCoordinate = (fileIndex, rankIndex) => {
    fileIndex = Number(fileIndex);
    rankIndex = Number(rankIndex);
    const file = String.fromCharCode(97 + fileIndex);
    const rank = (rankIndex + 1).toString();
    return file + rank;
};
