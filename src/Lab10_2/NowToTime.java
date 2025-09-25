package Lab10_2;

public class NowToTime {
    public static String convertMillis(long millis){
        int timezone = 7; // GMT+7

        int aDay = (int) (millis % 86400000);
        int hours = aDay / 3600000;
        int anHour = aDay % 3600000;
        int minutes = anHour / 60000;
        int aMinute = anHour % 60000;
        int seconds = aMinute / 1000;

        hours += timezone;

        return "".format("%02d:%02d:%02d", hours, minutes, seconds);
    }
    public static void main(String[] args) {
        System.out.println("Current time (h:m:s): " + convertMillis(System.currentTimeMillis()));
    }
}
