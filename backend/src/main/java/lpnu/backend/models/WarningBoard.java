package lpnu.backend.models;

public class WarningBoard extends Instrument {
    private String message;
    private String level;

    public WarningBoard() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
}