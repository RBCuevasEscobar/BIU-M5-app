package mx.iqenglish.tutoring.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class GroupReportDTO {
    private LocalDateTime generatedAt = LocalDateTime.now();
    private String generatedBy;
    private String scope;
    private int totalGroups;
    private int totalCapacity;
    private int totalEnrolled;
    private int totalAvailableSeats;
    private double averageOccupancyPercentage;
    private int publishedCount;
    private int inactiveCount;
    private int cancelledCount;
    private List<GroupReportItemDTO> items = new ArrayList<>();

    public GroupReportDTO() {}

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }
    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    public int getTotalGroups() { return totalGroups; }
    public void setTotalGroups(int totalGroups) { this.totalGroups = totalGroups; }
    public int getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(int totalCapacity) { this.totalCapacity = totalCapacity; }
    public int getTotalEnrolled() { return totalEnrolled; }
    public void setTotalEnrolled(int totalEnrolled) { this.totalEnrolled = totalEnrolled; }
    public int getTotalAvailableSeats() { return totalAvailableSeats; }
    public void setTotalAvailableSeats(int totalAvailableSeats) { this.totalAvailableSeats = totalAvailableSeats; }
    public double getAverageOccupancyPercentage() { return averageOccupancyPercentage; }
    public void setAverageOccupancyPercentage(double averageOccupancyPercentage) { this.averageOccupancyPercentage = averageOccupancyPercentage; }
    public int getPublishedCount() { return publishedCount; }
    public void setPublishedCount(int publishedCount) { this.publishedCount = publishedCount; }
    public int getInactiveCount() { return inactiveCount; }
    public void setInactiveCount(int inactiveCount) { this.inactiveCount = inactiveCount; }
    public int getCancelledCount() { return cancelledCount; }
    public void setCancelledCount(int cancelledCount) { this.cancelledCount = cancelledCount; }
    public List<GroupReportItemDTO> getItems() { return items; }
    public void setItems(List<GroupReportItemDTO> items) { this.items = items; }
}
