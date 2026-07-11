package Lab0102;

class Rank {
    private int rank;

    private int startRank;
    private int endRank;

    private boolean plus = false;
    
    public Rank(String rank) {
        if(rank.isEmpty()) {
            // rank 0 = n/a
            this.rank = 0;
        } else if(rank.contains("-")) {
            String[] ranks = rank.split("-");
            this.startRank = Integer.parseInt(ranks[0]);
            this.endRank = Integer.parseInt(ranks[1]);
        } else if (rank.contains("+")) {
            this.rank = Integer.parseInt(rank.replace("+", ""));
            this.plus = true;
        } else if (rank.contains("=")) {
            this.rank = Integer.parseInt(rank.replace("=", ""));
        } else {
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

    public int getStartRank() {
        if(startRank != 0)
            return startRank;
        else
            return rank;
    }
}

class Assessment {
    private double score;
    private Rank rank;

    public Assessment(double score, String rank) {
        this.score = score;
        this.rank = new Rank(rank);
    }

    public Assessment(String score, String rank) {
        if(score.isEmpty() || score.equals("-")) {
            this.score = 0;
            this.rank = new Rank(rank);
        } else {
            this.score = Double.parseDouble(score);
            this.rank = new Rank(rank);
        }
    }

    public double getScore() {
        return score;
    }
    public void setScore(double score) {
        this.score = score;
    }
    public String getRank() {
        return rank.getRank();
    }
    public Rank getRankObj() {
        return rank;
    }
}

public class UniData implements Comparable<UniData> {
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
        String[] tokens = line.split(",(?=(?:[^\\\"]*\\\"[^\\\"]*\\\")*[^\\\"]*$)");
        this.current_rank = new Rank(tokens[0]);
        this.previous_rank = new Rank(tokens[1]);
        this.institution_name = tokens[2];
        this.country = tokens[3];
        this.region = tokens[4];
        this.size = tokens[5];
        this.focus = tokens[6];
        this.research = tokens[7];
        this.status = tokens[8];
        this.AR = new Assessment(tokens[9], tokens[10]);
        this.ER = new Assessment(tokens[11], tokens[12]);
        this.FSR = new Assessment(tokens[13], tokens[14]);
        this.CPF = new Assessment(tokens[15], tokens[16]);
        this.IFR = new Assessment(tokens[17], tokens[18]);
        this.ISR = new Assessment(tokens[19], tokens[20]);
        this.ISD = new Assessment(tokens[21], tokens[22]);
        this.IRN = new Assessment(tokens[23], tokens[24]);
        this.EO = new Assessment(tokens[25], tokens[26]);
        this.SUS = new Assessment(tokens[27], tokens[28]);
        String temp_overall_score = tokens[29];
        if(temp_overall_score.isEmpty() || temp_overall_score.equals("-")) {
            this.overall_score = 0;
        } else {
            this.overall_score = Double.parseDouble(temp_overall_score);
        }
    }

    public String getInstitutionName() {
        return this.institution_name;
    }
    public void setInstitutionName(String institution_name) {
        this.institution_name = institution_name;
    }

    public Rank getCurrentRank() {
        return current_rank;
    }
    public void setCurrentRank(Rank current_rank) {
        this.current_rank = current_rank;
    }

    public Rank getPreviousRank() {
        return previous_rank;
    }
    public void setPreviousRank(Rank previous_rank) {
        this.previous_rank = previous_rank;
    }

    public String getCountry() {
        return country;
    }
    public void setCountry(String country) {
        this.country = country;
    }

    public String getRegion() {
        return region;
    }
    public void setRegion(String region) {
        this.region = region;
    }

    public String getSize() {
        return size;
    }
    public void setSize(String size) {
        this.size = size;
    }

    public String getFocus() {
        return focus;
    }
    public void setFocus(String focus) {
        this.focus = focus;
    }

    public String getResearch() {
        return research;
    }
    public void setResearch(String research) {
        this.research = research;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public Assessment getAR() {
        return AR;
    }
    public void setAR(Assessment AR) {
        this.AR = AR;
    }

    public Assessment getER() {
        return ER;
    }
    public void setER(Assessment ER) {
        this.ER = ER;
    }

    public Assessment getFSR() {
        return FSR;
    }
    public void setFSR(Assessment FSR) {
        this.FSR = FSR;
    }

    public Assessment getCPF() {
        return CPF;
    }
    public void setCPF(Assessment CPF) {
        this.CPF = CPF;
    }

    public Assessment getIFR() {
        return IFR;
    }
    public void setIFR(Assessment IFR) {
        this.IFR = IFR;
    }

    public Assessment getISR() {
        return ISR;
    }
    public void setISR(Assessment ISR) {
        this.ISR = ISR;
    }

    public Assessment getISD() {
        return ISD;
    }
    public void setISD(Assessment ISD) {
        this.ISD = ISD;
    }

    public Assessment getIRN() {
        return IRN;
    }
    public void setIRN(Assessment IRN) {
        this.IRN = IRN;
    }

    public Assessment getEO() {
        return EO;
    }
    public void setEO(Assessment EO) {
        this.EO = EO;
    }

    public Assessment getSUS() {
        return SUS;
    }
    public void setSUS(Assessment SUS) {
        this.SUS = SUS;
    }

    public double getOverallScore() {
        return overall_score;
    }
    public void setOverallScore(double overall_score) {
        this.overall_score = overall_score;
    }

    @Override
    public int compareTo(UniData uni) {
        return this.institution_name.compareTo(uni.institution_name);
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
