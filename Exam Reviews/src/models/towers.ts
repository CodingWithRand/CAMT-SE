// This file contains the structure of the data. Custom datatypes are defined here. (Model)
type NonSC = "easy" | "medium" | "hard" | "difficult" | "challenging" | "intense" | "remorseless";
type SC = "insane" | "extreme" | "terrifying" | "catastrophic";
export type Tower = {
    name: string;
    acronym: string;
    floorCount: number;
    difficulty: NonSC | SC;
}