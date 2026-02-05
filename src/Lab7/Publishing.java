package Lab7;

class Publication {
    protected String publisher;
    protected int pageNum;
    protected double price;
    protected String title;

    public Publication(String publisher, int pageNum, double price, String title) {
        this.publisher = publisher;
        this.pageNum = pageNum;
        this.price = price;
        this.title = title;
    }

    public void print() {
        System.out.println("Publisher: " + this.publisher + "\nPage Number: " + this.pageNum + "\nPrice: " + this.price + "\nTitle: " + this.title);
    }
}

class Book extends Publication {
    private String author;

    public Book(String publisher, int pageNum, double price, String title, String author) {
        super(publisher, pageNum, price, title);
        this.author = author;
    }

    @Override
    public void print() {
        System.out.println("Publisher: " + this.publisher + "\nPage Number: " + this.pageNum + "\nPrice: " + this.price + "\nTitle: " + this.title + "\nAuthor: " + this.author);
    }
}

class Magazine extends Publication {
    protected String publicationUnit;

    public Magazine(String publisher, int pageNum, double price, String title, String publicationUnit) {
        super(publisher, pageNum, price, title);
        this.publicationUnit = publicationUnit;
    }

    @Override
    public void print() {
        System.out.println("Publisher: " + this.publisher + "\nPage Number: " + this.pageNum + "\nPrice: " + this.price + "\nTitle: " + this.title + "\nPublication Unit: " + this.publicationUnit);
    }
}

class KidsMagazine extends Magazine {
    private int minAge;
    private int maxAge;

    public KidsMagazine(String publisher, int pageNum, double price, String title, String publicationUnit, int minAge, int maxAge) {
        super(publisher, pageNum, price, title, publicationUnit);
        this.minAge = minAge;
        this.maxAge = maxAge;
    }

    @Override
    public void print() {
        System.out.println("Publisher: " + this.publisher + "\nPage Number: " + this.pageNum + "\nPrice: " + this.price + "\nTitle: " + this.title + "\nPublication Unit: " + this.publicationUnit + "\nAge Range: " + this.minAge + " to " + this.maxAge);
    }
}

public class Publishing {
    public static void main(String[] args) {
        Publication[] publications = {
            new Publication("ABC Press", 150, 15.99, "Understanding Java"),
            new Book("XYZ Publishing", 320, 29.99, "The Great Novel", "John Smith"),
            new Magazine("Daily News", 50, 5.99, "Tech Weekly", "Weekly"),
            new KidsMagazine("Kids Fun", 40, 7.99, "Adventure Tales", "Monthly", 4, 8),
            new Publication("Global Publishers", 200, 19.99, "World History"),
            new Book("Literary Press", 450, 34.99, "Poetry Collection", "Jane Doe"),
            new Magazine("Science Today", 60, 8.99, "Nature Magazine", "Bi-weekly"),
            new KidsMagazine("Learning House", 32, 6.99, "Cartoon Fun", "Weekly", 2, 6),
            new Publication("Academic Press", 280, 25.00, "Scientific Methods"),
            new Book("Fiction House", 380, 24.99, "Mystery Story", "Robert Johnson")
        };
        for(Publication p: publications) {
            p.print();
            System.out.println("----------------------------------");
        }
    }
}
