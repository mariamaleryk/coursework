package lpnu.backend.models;

import java.util.Objects;

public class DigitalDisplay extends Instrument {

    private String fontFamily;
    private String unit;
    private Integer width;
    private Integer height;

    public DigitalDisplay() {
        super();
    }

    public String getFontFamily() {
        return fontFamily;
    }

    public void setFontFamily(String fontFamily) {
        this.fontFamily = fontFamily;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        DigitalDisplay that = (DigitalDisplay) o;

        return Objects.equals(fontFamily, that.fontFamily) &&
                Objects.equals(unit, that.unit) &&
                Objects.equals(width, that.width) &&
                Objects.equals(height, that.height);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), fontFamily, unit, width, height);
    }
}