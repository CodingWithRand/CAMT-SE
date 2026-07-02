package se233.chapter1.controller;

import se233.chapter1.model.character.BasedCharacter;
import se233.chapter1.model.character.Battlemage;
import se233.chapter1.model.character.MagicalCharacter;
import se233.chapter1.model.character.PhysicalCharacter;

import java.util.Random;

public class GenCharacter {
    public static BasedCharacter setUpCharacter() {
        BasedCharacter character;
        Random rand = new Random();
        int type = rand.nextInt(3) + 1;
        int basedDef = rand.nextInt(50) + 1;
        int basedRes = rand.nextInt(50) + 1;
        switch(type) {
            case 1:
                character = new PhysicalCharacter("PhysicalChar1", "assets/knight.png", basedDef, basedRes);
                break;
            case 2:
                character = new MagicalCharacter("MagicChar1", "assets/wizard.png", basedDef, basedRes);
                break;
            case 3: default:
                character = new Battlemage("BattleMage1", "assets/battlemage.png", basedDef, basedRes);
                break;
        }
        return character;
    }
}
