package lpnu.backend.models;

public class DialGauge extends Instrument {
    private double min;
    private double max;
    private double currentValue;
    private String unit;

    public DialGauge() {}

    public double getMin() { return min; }
    public void setMin(double min) { this.min = min; }
    public double getMax() { return max; }
    public void setMax(double max) { this.max = max; }
    public double getCurrentValue() { return currentValue; }
    public void setCurrentValue(double currentValue) { this.currentValue = currentValue; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
}