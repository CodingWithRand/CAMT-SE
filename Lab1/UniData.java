package Lab1;

import java.util.StringTokenizer;

class Rank {
    private int rank;

    private int startRank;
    private int endRank;

    private boolean plus = false;
    
    public Rank(String rank) {
        if(rank.contains("-")) {
            String[] ranks = rank.split("-");
            this.startRank = Integer.parseInt(ranks[0]);
            this.endRank = Integer.parseInt(ranks[1]);
        } else if (rank.contains("+")) {
            this.rank = Integer.parseInt(rank.replace("+", ""));
            this.plus = true;
        } else if (rank.contains("=")) {
            this.rank = Integer.parseInt(rank.replace("=", ""));
        }else {
            this.rank = Integer.parseInt(rank);
        }
    }

    public String getRank() {
        if(startRank != 0 && endRank != 0) 
            return startRank + "-" + endRank;
        else if(plus)
            return rank + "+";
        else
            return Integer.toString(rank);
    }
}

class Assessment {
    private double score;
    private Rank rank;

    public Assessment(double score, String rank) {
        this.score = score;
        this.rank = new Rank(rank);
    }

    public double getScore() {
        return score;
    }
    public String getRank() {
        return rank.getRank();
    }
}

public class UniData {
    private Rank current_rank;
    private Rank previous_rank;
    private String institution_name;
    private String country;
    private String region;
    private String size;
    private String focus;
    private String research;
    private String status;
    private Assessment AR;
    private Assessment ER;
    private Assessment FSR;
    private Assessment CPF;
    private Assessment IFR;
    private Assessment ISR;
    private Assessment ISD;
    private Assessment IRN;
    private Assessment EO;
    private Assessment SUS;
    private double overall_score;

    public UniData(String line) {
        StringTokenizer tokenizer = new StringTokenizer(line, ",");
        this.current_rank = new Rank(tokenizer.nextToken());
        this.previous_rank = new Rank(tokenizer.nextToken());
        this.institution_name = tokenizer.nextToken();
        this.country = tokenizer.nextToken();
        this.region = tokenizer.nextToken();
        this.size = tokenizer.nextToken();
        this.focus = tokenizer.nextToken();
        this.research = tokenizer.nextToken();
        this.status = tokenizer.nextToken();
        this.AR = new Assessment(Double.parseDouble(tokenizer.nextToken()), tokenizer.nextToken());
        this.ER = new Assessment(Double.parseDouble(tokenizer.nextToken()), tokenizer.nextToken());
        this.FSR = new Assessment(Double.parseDouble(tokenizer.nextToken()), tokenizer.nextToken());
        this.CPF = new Assessment(Double.parseDouble(tokenizer.nextToken()), tokenizer.nextToken());
        this.IFR = new Assessment(Double.parseDouble(tokenizer.nextToken()), tokenizer.nextToken());
        this.ISR = new Assessment(Double.parseDouble(tokenizer.nextToken()), tokenizer.nextToken());
        this.ISD = new Assessment(Double.parseDouble(tokenizer.nextToken()), tokenizer.nextToken());
        this.IRN = new Assessment(Double.parseDouble(tokenizer.nextToken()), tokenizer.nextToken());
        this.EO = new Assessment(Double.parseDouble(tokenizer.nextToken()), tokenizer.nextToken());
        this.SUS = new Assessment(Double.parseDouble(tokenizer.nextToken()), tokenizer.nextToken());
        this.overall_score = Double.parseDouble(tokenizer.nextToken());
    }

    @Override
    public String toString() {
        return "== University Data ==\n" +
                "Current Rank: " + current_rank.getRank() + "\n" +
                "Previous Rank: " + previous_rank.getRank() + "\n" +
                "Institution Name: " + institution_name + "\n" +
                "Country/Territory: " + country + "\n" +
                "Region: " + region + "\n" +
                "Size: " + size + "\n" +
                "Focus: " + focus + "\n" +
                "Research: " + research + "\n" +
                "Status: " + status + "\n" +
                "AR Score: " + AR.getScore() + ", AR Rank: " + AR.getRank() + "\n" +
                "ER Score: " + ER.getScore() + ", ER Rank: " + ER.getRank() + "\n" +
                "FSR Score: " + FSR.getScore() + ", FSR Rank: " + FSR.getRank() + "\n" +
                "CPF Score: " + CPF.getScore() + ", CPF Rank: " + CPF.getRank() + "\n" +
                "IFR Score: " + IFR.getScore() + ", IFR Rank: " + IFR.getRank() + "\n" +
                "ISR Score: " + ISR.getScore() + ", ISR Rank: " + ISR.getRank() + "\n" +
                "ISD Score: " + ISD.getScore() + ", ISD Rank: " + ISD.getRank() + "\n" +
                "IRN Score: " + IRN.getScore() + ", IRN Rank: " + IRN.getRank() + "\n" +
                "EO Score: " + EO.getScore() + ", EO Rank: " + EO.getRank() + "\n" +
                "SUS Score: " + SUS.getScore() + ", SUS Rank: " + SUS.getRank() + "\n" +
                "Overall Score: " + overall_score;
    }
}
