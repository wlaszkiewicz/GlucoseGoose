import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

type ReportData = {
  patientName: string;
  reportDate: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
  glucoseTrends: Array<{
    day: string;
    glucose: number;
  }>;
  timeInRange: {
    inRange: number;
    high: number;
    low: number;
  };
  recommendations: string[];
};

export const ReportService = {
  async generateReport(data: ReportData): Promise<{
    success: boolean;
    content?: string;
    htmlContent?: string;
    error?: string;
  }> {
    try {
      const textContent = this.generateTextReportContent(data);
      const htmlContent = this.generateHTMLReportContent(data);

      return {
        success: true,
        content: textContent,
        htmlContent: htmlContent,
      };
    } catch (error) {
      console.error("Error generating report:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  generateTextReportContent(data: ReportData): string {
  const lines = [];

  lines.push("                      GLUCOSE GOOSE");
  lines.push("           DIABETES MANAGEMENT REPORT");
  lines.push("");
  
  lines.push("PATIENT DATA");
  lines.push("------------");
  lines.push(`Patient:     ${data.patientName}`);
  lines.push(`Report Date: ${data.reportDate}`);
  lines.push(`Report ID:   GG-${Date.now().toString().slice(-8)}`);
  lines.push("");
  
  lines.push("SUMMARY METRICS");
  lines.push("---------------");
  data.stats.forEach((stat) => {
    lines.push(`${stat.label.padEnd(25)}${stat.value}`);
  });
  lines.push("");
  
  lines.push("GLUCOSE PROFILE (Last 7 Days)");
  lines.push("-----------------------------");
  data.glucoseTrends.forEach((trend) => {
    const status = trend.glucose < 70 ? "LOW" : trend.glucose > 180 ? "HIGH" : "NORMAL";
    lines.push(`${trend.day.padEnd(10)}${trend.glucose.toString().padStart(6)} mg/dL   [${status}]`);
  });
  lines.push(`Weekly Average: ${this.calculateAverage(data.glucoseTrends.map((t) => t.glucose))} mg/dL`);
  lines.push("");
  
  lines.push("TIME IN RANGE ANALYSIS");
  lines.push("----------------------");
  lines.push(`In Range (70-180 mg/dL):  ${data.timeInRange.inRange}%`);
  lines.push(`High (>180 mg/dL):        ${data.timeInRange.high}%`);
  lines.push(`Low (<70 mg/dL):          ${data.timeInRange.low}%`);
  lines.push("");
  
  lines.push("CLINICAL RECOMMENDATIONS");
  lines.push("------------------------");
  data.recommendations.forEach((rec, index) => {
    lines.push(`${index + 1}. ${rec}`);
  });
  lines.push("");
  
  lines.push("End of Report");
  lines.push(`Generated: ${new Date().toLocaleString()}`);

  return lines.join("\n");
},

  generateHTMLReportContent(data: ReportData): string {
    const vintageColors = {
      lightBackground: "#f5f1e7",
      cardBackground: "#fffaf0",
      border: "#d4c4a8",
      primaryText: "#3c2f2f",
      secondaryText: "#76634e",
      statIcon: "#7d6b58",
      statValue: "#3c2f2f",
      statLabel: "#76634e",
      iconGreen: "#2e6c14",
      iconYellow: "#c08d0c",
      iconBlue: "#6b8ba4",
      iconPink: "#ff0026",
      iconPurple: "#967bb6",
      headerTitle: "#5d4c3c",
      headerLine: "#d4c4a8",
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Glucose Goose Report - ${data.patientName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');
          
          body {
            font-family: 'Inter', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: ${vintageColors.primaryText};
            background-color: #ffffff;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .vintage-container {
            background-color: #ffffff;
            border-radius: 20px;
            border: 1px solid ${vintageColors.border};
            padding: 30px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          }
          
          .header {
            text-align: center;
            padding-bottom: 25px;
            margin-bottom: 30px;
            position: relative;
          }
          
          .header-decoration {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          }
          
          .header-line {
            width: 50px;
            height: 1px;
            background-color: ${vintageColors.headerLine};
            margin: 0 15px;
          }
          
          .header-title {
            font-size: 28px;
            font-weight: 300;
            color: ${vintageColors.headerTitle};
            letter-spacing: 2px;
            margin: 0;
          }
          
          .header-subtitle {
            font-size: 14px;
            color: ${vintageColors.secondaryText};
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-top: 5px;
          }
          
          .patient-card {
            background-color: ${vintageColors.lightBackground};
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 30px;
            border: 1px solid ${vintageColors.border};
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
          }
          
          .patient-title {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
          }
          
          .patient-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background-color: ${vintageColors.iconGreen};
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
          }
          
          .patient-info h2 {
            font-size: 20px;
            font-weight: 300;
            color: ${vintageColors.primaryText};
            margin: 0 0 5px 0;
            letter-spacing: 1px;
          }
          
          .patient-details {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
          }
          
          .detail-item {
            flex: 1;
            min-width: 200px;
          }
          
          .detail-label {
            font-size: 11px;
            color: ${vintageColors.statLabel};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .detail-value {
            font-size: 16px;
            color: ${vintageColors.primaryText};
            font-weight: 400;
          }
          
          .section {
            margin-bottom: 35px;
            page-break-inside: avoid;
          }
          
          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: 300;
            color: ${vintageColors.primaryText};
            letter-spacing: 1px;
            margin: 0;
          }
          
          .feather-accent {
            width: 32px;
            height: 32px;
            border-radius: 16px;
            background-color: ${vintageColors.lightBackground};
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid ${vintageColors.border};
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            background-color: ${vintageColors.lightBackground};
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid ${vintageColors.border};
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          }
          
          .stat-icon {
            width: 36px;
            height: 36px;
            border-radius: 18px;
            background-color: ${vintageColors.cardBackground};
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px auto;
            border: 1px solid ${vintageColors.border};
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: 300;
            color: ${vintageColors.statValue};
            margin-bottom: 4px;
            font-family: 'Inter', sans-serif;
          }
          
          .stat-label {
            font-size: 11px;
            color: ${vintageColors.statLabel};
            font-weight: 400;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          
          .trends-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 20px;
          }
          
          .trends-table th {
            background-color: ${vintageColors.lightBackground};
            padding: 15px;
            text-align: left;
            border-bottom: 2px solid ${vintageColors.border};
            color: ${vintageColors.primaryText};
            font-weight: 400;
            letter-spacing: 0.5px;
          }
          
          .trends-table td {
            padding: 15px;
            border-bottom: 1px solid ${vintageColors.border};
          }
          
          .trends-table tr:hover {
            background-color: ${vintageColors.lightBackground};
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-normal {
            background-color: rgba(138, 154, 91, 0.1);
            color: ${vintageColors.iconGreen};
            border: 1px solid ${vintageColors.iconGreen};
          }
          
          .status-high {
            background-color: rgba(183, 110, 121, 0.1);
            color: ${vintageColors.iconPink};
            border: 1px solid ${vintageColors.iconPink};
          }
          
          .status-low {
            background-color: rgba(212, 160, 23, 0.1);
            color: ${vintageColors.iconYellow};
            border: 1px solid ${vintageColors.iconYellow};
          }
          
          .time-range-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .time-card {
            background-color: ${vintageColors.lightBackground};
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            border: 1px solid ${vintageColors.border};
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          }
          .time-value {
            font-size: 28px;
            font-weight: 300;
            margin-bottom: 8px;
            font-family: 'Inter', sans-serif;
          }
          
          .time-in-range { color: ${vintageColors.iconGreen}; }
          .time-high { color: ${vintageColors.iconPink}; }
          .time-low { color: ${vintageColors.iconYellow}; }
          
          .time-label {
            font-size: 11px;
            color: ${vintageColors.statLabel};
            text-transform: uppercase;
            letter-spacing: 0.5px;
            line-height: 1.4;
          }
          
          .recommendations-card {
            background-color: ${vintageColors.lightBackground};
            border-radius: 12px;
            padding: 25px;
            border: 1px solid ${vintageColors.border};
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
          }
          
          .recommendation-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid ${vintageColors.border};
          }
          
          .recommendation-item:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
          }
          
          .recommendation-number {
            min-width: 28px;
            height: 28px;
            border-radius: 14px;
            background-color: ${vintageColors.cardBackground};
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 14px;
            color: ${vintageColors.primaryText};
            border: 1px solid ${vintageColors.border};
          }
          
          .recommendation-text {
            flex: 1;
            color: ${vintageColors.primaryText};
            line-height: 1.6;
          }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid ${vintageColors.border};
            color: ${vintageColors.secondaryText};
            font-size: 12px;
            letter-spacing: 0.5px;
          }
          
          .footer-line {
            width: 60px;
            height: 1px;
            background-color: ${vintageColors.border};
            margin: 15px auto;
          }
          
          @media print {
            body {
              padding: 10px;
            }
            
            .vintage-container {
              box-shadow: none;
              border: 1px solid ${vintageColors.border};
            }
            
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="vintage-container">
          <div class="header">
            <div class="header-decoration">
              <div class="header-line"></div>
              <h1 class="header-title">Glucose Goose Report</h1>
              <div class="header-line"></div>
            </div>
            <p class="header-subtitle">Vintage Diabetes Analysis</p>
          </div>
          
          <div class="patient-card">
            <div class="patient-title">
              <div class="patient-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="patient-info">
                <h2>Patient Information</h2>
              </div>
            </div>
            
            <div class="patient-details">
              <div class="detail-item">
                <div class="detail-label">Patient Name</div>
                <div class="detail-value">${data.patientName}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Report Date</div>
                <div class="detail-value">${data.reportDate}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">Report ID</div>
                <div class="detail-value">GG-${Date.now().toString().slice(-8)}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">Statistics Summary</h2>
              <div class="feather-accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20v-6M6 20V10M18 20V4"></path>
                </svg>
              </div>
            </div>
            
            <div class="stats-grid">
              ${data.stats
                .map(
                  (stat) => `
                <div class="stat-card">
                  <div class="stat-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${vintageColors.statIcon}" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div class="stat-value">${stat.value}</div>
                  <div class="stat-label">${stat.label}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">Glucose Trends</h2>
              <div class="feather-accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
            </div>
            
            <table class="trends-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Glucose (mg/dL)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.glucoseTrends
                  .map((trend) => {
                    const status =
                      trend.glucose < 70
                        ? { text: "Low", class: "status-low" }
                        : trend.glucose > 180
                        ? { text: "High", class: "status-high" }
                        : { text: "Normal", class: "status-normal" };
                    
                    return `
                    <tr>
                      <td>${trend.day}</td>
                      <td><strong>${trend.glucose}</strong> mg/dL</td>
                      <td><span class="status-badge ${status.class}">${status.text}</span></td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
            
            <div style="text-align: center; color: ${vintageColors.secondaryText};">
              Weekly Average: <strong>${this.calculateAverage(data.glucoseTrends.map((t) => t.glucose))} mg/dL</strong>
            </div>
          </div>
          
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">Time in Range</h2>
              <div class="feather-accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            </div>
            
            <div class="time-range-cards">
              <div class="time-card">
                <div class="time-value time-in-range">${data.timeInRange.inRange}%</div>
                <div class="time-label">
                  In Range<br>
                  <span style="font-size: 10px;">70-180 mg/dL</span>
                </div>
              </div>
              
              <div class="time-card">
                <div class="time-value time-high">${data.timeInRange.high}%</div>
                <div class="time-label">
                  High<br>
                  <span style="font-size: 10px;">>180 mg/dL</span>
                </div>
              </div>
              
              <div class="time-card">
                <div class="time-value time-low">${data.timeInRange.low}%</div>
                <div class="time-label">
                  Low<br>
                  <span style="font-size: 10px;"><70 mg/dL</span>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; color: ${vintageColors.secondaryText}; font-size: 12px;">
              Total monitored time: ${data.timeInRange.inRange + data.timeInRange.high + data.timeInRange.low}%
            </div>
          </div>
          
          <div class="section">
            <div class="section-header">
              <h2 class="section-title">Clinical Recommendations</h2>
              <div class="feather-accent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
            
            <div class="recommendations-card">
              ${data.recommendations
                .map(
                  (rec, index) => `
                <div class="recommendation-item">
                  <div class="recommendation-number">${index + 1}</div>
                  <div class="recommendation-text">${rec}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-line"></div>
            <p>Generated by Glucose Goose - Vintage Diabetes Management System</p>
            <p style="font-size: 11px; margin-top: 5px;">
              This report is for medical professional use only.<br>
              Always verify with clinical judgment.
            </p>
            <p style="margin-top: 10px; font-style: italic;">
              Report generated on: ${new Date().toLocaleString()}
            </p>
            <p class="no-print" style="margin-top: 15px; font-size: 10px; color: ${vintageColors.border};">
              To save as PDF, use your browser's print function and select "Save as PDF"
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return Math.round(sum / numbers.length);
  },

  wrapText(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      if (currentLine.length + words[i].length + 1 <= maxLength) {
        currentLine += ' ' + words[i];
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    return lines;
  },
};