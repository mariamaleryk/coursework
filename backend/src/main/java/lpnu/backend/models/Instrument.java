package lpnu.backend.models;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.UUID;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = DialGauge.class, name = "DIAL_GAUGE"),
        @JsonSubTypes.Type(value = WarningBoard.class, name = "WARNING_BOARD")
})
public abstract class Instrument {
    private String id;
    private String name;
    private int x;
    private int y;

    // НОВІ ПОЛЯ ВІЗУАЛІЗАЦІЇ
    private String size = "medium";
    private String colorTheme = "light";
    private String fontFamily = "standard";

    public Instrument() {
        this.id = UUID.randomUUID().toString();
        this.x = 50;
        this.y = 50;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getX() { return x; }
    public void setX(int x) { this.x = x; }
    public int getY() { return y; }
    public void setY(int y) { this.y = y; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getColorTheme() { return colorTheme; }
    public void setColorTheme(String colorTheme) { this.colorTheme = colorTheme; }
    public String getFontFamily() { return fontFamily; }
    public void setFontFamily(String fontFamily) { this.fontFamily = fontFamily; }
}