package lpnu.backend.models;

import java.util.Objects;

public class DigitalDisplay extends Instrument {
    private String fontFamily;
    private String unit;
    private double currentValue;

    public DigitalDisplay() {
        super();
    }

    public String getFontFamily() { return fontFamily; }
    public void setFontFamily(String fontFamily) { this.fontFamily = fontFamily; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public double getCurrentValue() { return currentValue; }
    public void setCurrentValue(double currentValue) { this.currentValue = currentValue; }

}