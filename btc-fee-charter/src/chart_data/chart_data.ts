import { makeApiCall } from "../lib/network/network";
import { IndexResponse } from "./interface";
import "chartjs-adapter-date-fns";
import {
  CategoryScale,
  Chart,
  Chart as ChartJS,
  ChartOptions,
  elements,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  SubTitle,
  TimeScale,
  Title,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  SubTitle,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
);

const verticalLinePlugin = {
  id: "verticalLine",
  afterDraw(chart, args, options) {
    const { ctx, tooltip } = chart;
    if (tooltip._active && tooltip._active.length) {
      const activePoint = tooltip._active[0];
      const x = activePoint.element.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      // Draw the vertical line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = options.lineWidth || 1;
      ctx.strokeStyle = options.lineColor || "#000";
      ctx.stroke();
      ctx.restore();
    }
  },
};

Chart.register(verticalLinePlugin);

Chart.defaults.elements.point.pointStyle = false;
Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.line.borderWidth = 1.5;
Chart.defaults.elements.line.tension = 0;
Chart.defaults.scales.time.adapters.date = { "timezone": "UTC" };
Chart.defaults.backgroundColor = "rgb(255,255,255)";
// Chart.defaults.color = "rgb(255,255,255)";
Chart.defaults.scale.ticks.color = "rgb(255,255,255)";
Chart.defaults.scale.grid.color = "rgba(199, 199, 199, 0.2)";

//match with componenets/styles.css
const titleColor = "rgb(211, 211, 211)";
const subtitleColor = "rgb(190,190,190)";

export const chartOptions = {
  scales: {
    x: {
      type: "time" as const,
      time: {
        unit: "hour" as const,
      },
    },
  },
  responsive: true,
  plugins: {
    legend: {
      align: "start" as const,
      position: "bottom" as const,
      fill: true as const,
      labels: {
        //color: "rgb(255,0,0)",
        pointStyleWidth: 40,
        usePointStyle: true,
        pointStyle: "rectRounded" as const,
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    tooltip: {
      enabled: true,
      //  mode: 'index', // Display tooltips at nearest data point across lines
      intersect: false, // Display tooltips for all points, not just hovered ones
    },
    title: {
      display: true,
      position: "top" as const,
      align: "start" as const,
      padding: { "top": 0, "bottom": 10 },
      text: "Fee Estimate Index",
      color: titleColor,
      font: {
        family: "'Courier New', monospace",
        size: 20,
      },
    },
    subtitle: {
      display: true,
      position: "top" as const,
      align: "start" as const,
      padding: { "top": 0, "bottom": 30 },
      text: "Current Fee Estimate/Fee Estimate Moving Average",
      color: subtitleColor,
      font: {
        family: "'Courier New', monospace",
        size: 14, // Set the desired font size here
      },
    },

    verticalLine: {
      lineWidth: 1.5, // Customize the line width
      lineColor: "rgba(255, 0, 0, 0.75)", // Customize the line color
    },
    filler: {},
  },
};

export async function fetchChartDataFeeIndex() {
  const res = await makeApiCall(
    "http://localhost:3561/service/indexHistory",
    "GET",
  );

  if (res instanceof Error) {
    throw res;
  }

  let feeIndexHistory: IndexResponse[] = [];

  res.forEach((element) => {
    const feeIndex: IndexResponse = {
      timestamp: element["timestamp"],
      feeEstimateMovingAverageRatio: {
        last365Days: element["feeEstimateMovingAverageRatio"]["last365Days"],
        last30Days: element["feeEstimateMovingAverageRatio"]["last30Days"],
      },
      currentFeeEstimate: {
        satsPerByte: element["currentFeeEstimate"]["satsPerByte"],
      },
      movingAverage: {
        createdAt: element["movingAverage"]["createdAt"],
        last365Days: element["movingAverage"]["last365Days"],
        last30Days: element["movingAverage"]["last30Days"],
      },
    };

    feeIndexHistory.push(feeIndex);
  });

  const dataSet30Day: { x: Date; y: number }[] = [];
  const dataSet365Day: { x: Date; y: number }[] = [];

  feeIndexHistory.forEach((element) => {
    dataSet30Day.push({
      x: element.timestamp,
      y: element.feeEstimateMovingAverageRatio.last30Days,
    });
    dataSet365Day.push({
      x: element.timestamp,
      y: element.feeEstimateMovingAverageRatio.last365Days,
    });
  });

  const dataSetFeeIndex = {
    datasets: [
      {
        fill: {
          value: 1,
          above: "rgba(255,0,0,0.1)", // Area will be red above the origin
          below: "rgba(0, 255, 0,0.1)",
        },
        label: "Last 30 days",
        data: dataSet30Day,
        borderColor: "rgb(254, 112, 2)",
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day", // this can be 'second', 'minute', 'hour', 'day', 'week', 'month', 'year', etc.
              displayFormats: {
                day: "MMM D", // this will display the date as 'Jan 1', 'Feb 2', etc.
              },
            },
          },
        },
        //backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      // {
      //   label: "Last 365 days",
      //   data: dataSet365Day,
      //   borderColor: "rgb(53, 162, 235)",
      //   // backgroundColor: "rgba(53, 162, 235, 0.5)",
      //   borderWidth: 2
      // },
    ],
  };

  return dataSetFeeIndex;
}
