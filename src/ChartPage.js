import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format, parseISO } from "date-fns";
import "./ChartPage.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChartPage = ({ selectedDate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth,
    height: window.innerHeight
  });
  const navigate = useNavigate();

  const allConvoyeurs = [
    "PC.P1.CUMUL_RA50_P0",
    "PC.P1.CUMUL_RB50_P0",
    "PC.P1.CUMUL_RC50_P0",
    "PC.P1.CUMUL_RD50_P0",
  ];

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost/my-app/getData.php")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setData(data))
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredData = selectedDate
    ? data.filter((item) => {
        if (!item.debut) return false;
        try {
          const itemDate = parseISO(item.debut);
          return format(itemDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
        } catch (error) {
          console.error("Invalid date:", item.debut, error);
          return false;
        }
      })
    : [];

  const dataByConvoyeur = allConvoyeurs.map((convoyeur) => {
    const hasNominal = filteredData.some(
      (item) => item.nom_convoyeur === convoyeur && item.etat === "nominal"
    );
    return hasNominal ? 1 : 0;
  });

  const chartData = {
    labels: allConvoyeurs,
    datasets: [
      {
        label: "Convoyeurs en état nominal",
        data: dataByConvoyeur,
        backgroundColor: dataByConvoyeur.map((value) =>
          value === 1 ? "rgba(75, 192, 192, 0.7)" : "rgba(255, 99, 132, 0.7)"
        ),
        borderColor: dataByConvoyeur.map((value) =>
          value === 1 ? "rgba(75, 192, 192, 1)" : "rgba(255, 99, 132, 1)"
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const getChartOptions = () => {
    const isMobile = dimensions.width < 768;
    const isTablet = dimensions.width < 992;

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: isMobile ? "bottom" : "top",
          labels: {
            font: {
              size: isMobile ? 12 : 14,
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
            padding: isMobile ? 10 : 20,
          },
        },
        title: {
          display: true,
          text: selectedDate
            ? `État des Convoyeurs - ${format(selectedDate, "dd/MM/yyyy")}`
            : "État des Convoyeurs (Sélectionnez une date)",
          font: {
            size: isMobile ? 16 : isTablet ? 18 : 20,
            weight: "bold",
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          },
          padding: {
            top: isMobile ? 5 : 10,
            bottom: isMobile ? 5 : 10,
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleFont: {
            size: isMobile ? 14 : 16,
          },
          bodyFont: {
            size: isMobile ? 12 : 14,
          },
          padding: 12,
          cornerRadius: 4,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: {
            stepSize: 1,
            callback: (value) => (value === 1 ? "Nominal" : "Défaillant"),
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
        x: {
          ticks: {
            font: {
              size: isMobile ? 10 : 12,
            },
          },
        },
      },
    };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2 className="error-title">Erreur de chargement</h2>
        <p className="error-text">{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="chart-page-container">
      <div className="chart-header-container">
        <div className="compact-chart-header">
          <h2 className="chart-title">Tableau de Bord des Convoyeurs</h2>
          {selectedDate && (
            <p className="chart-subtitle">{format(selectedDate, "dd/MM/yyyy")}</p>
          )}
        </div>
      </div>

      <div className="chart-content-area">
        <div className="chart-wrapper">
          {selectedDate ? (
            <Bar 
              data={chartData} 
              options={getChartOptions()} 
              height={dimensions.width < 576 ? 300 : 400}
            />
          ) : (
            <p className="no-date-message">Sélectionnez une date pour afficher les données.</p>
          )}
        </div>

        {selectedDate && (
          <div className="stats-container">
            <div
              className="stat-card clickable"
              onClick={() => navigate("/convoyeur-details")}
            >
              <h3 className="stat-title">Total Convoyeurs</h3>
              <p className="stat-value">{allConvoyeurs.length}</p>
            </div>
            <div className="stat-card">
              <h3 className="stat-title">En état nominal</h3>
              <p className="stat-value nominal-value">
                {dataByConvoyeur.filter((val) => val === 1).length}
              </p>
            </div>
            <div className="stat-card">
              <h3 className="stat-title">Défaillants</h3>
              <p className="stat-value failed-value">
                {dataByConvoyeur.filter((val) => val === 0).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartPage;