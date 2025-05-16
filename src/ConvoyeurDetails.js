import React, { useEffect, useState, useCallback } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Download, Clock, Gauge, Circle, AlertCircle, Power, HelpCircle } from 'lucide-react';
import './ConvoyeurDetails.css';

const SEGMENTS_URL = 'http://localhost/my-app/getSegmentsFromV1.php';

const aliases = [
  "PC.pesage.FLM_RA50",
  "PC.pesage.FLM_RB50",
  "PC.pesage.FLM_RC50",
  "PC.pesage.FLM_RD50"
];

const formatDate = (d) => {
  const dateObj = new Date(d);
  const offset = dateObj.getTimezoneOffset();
  dateObj.setMinutes(dateObj.getMinutes() - offset);
  return dateObj.toISOString().split('T')[0];
};

function ConvoyeurDetails({ selectedDate }) {
  const date = selectedDate ? formatDate(selectedDate) : formatDate(new Date());
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${SEGMENTS_URL}?date=${encodeURIComponent(date)}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        console.log('API Response:', json);

        const initialData = {};
        aliases.forEach(alias => {
          initialData[alias] = json[alias] || { segments: [], debit: 0, hourly_data: [] };
        });

        setData(initialData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);

  const exportPDF = () => {
    const originalTitle = document.title;
    document.title = 'Etat des Marches - ' + date;
    window.print();
    document.title = originalTitle;
  };

  const processData = useCallback((jour, segs) => {
    const jourDebut = new Date(`${jour}T00:00:00`);
    const jourFin = new Date(`${jour}T23:59:59.999`);

    const today = formatDate(new Date());
    const jourDate = new Date(`${jour}T00:00:00`);
    const isToday = jour === today;
    const isFuture = jourDate.getTime() > new Date(`${today}T00:00:00`).getTime();

    const rawData = (segs || []).filter(r => {
      const dateFin = new Date(r.fin);
      return dateFin >= jourDebut && dateFin <= jourFin;
    }).sort((a, b) => new Date(a.fin) - new Date(b.fin));

    const adjustedData = [];
    let lastTime = new Date(jourDebut);

    if (rawData.length === 0) {
      adjustedData.push({ debut: lastTime, fin: jourFin, etat: isFuture ? 'futur' : 'inconnu' });
    } else {
      adjustedData.push({ debut: lastTime, fin: new Date(rawData[0].fin), etat: rawData[0].etat });
      lastTime = new Date(rawData[0].fin);

      for (let i = 1; i < rawData.length; i++) {
        adjustedData.push({ debut: lastTime, fin: new Date(rawData[i].fin), etat: rawData[i - 1].etat });
        lastTime = new Date(rawData[i].fin);
      }

      const finEffective = isToday ? new Date() : jourFin;
      if (!isFuture && lastTime < finEffective) {
        adjustedData.push({ debut: lastTime, fin: finEffective, etat: rawData[rawData.length - 1].etat });
      }
      if ((isToday || isFuture) && lastTime < jourFin) {
        adjustedData.push({ debut: lastTime, fin: jourFin, etat: 'futur' });
      }
    }

    const etatDurations = {};
    adjustedData.forEach(segment => {
      const sec = (segment.fin - segment.debut) / 1000;
      etatDurations[segment.etat] = (etatDurations[segment.etat] || 0) + sec;
    });

    const colors = {
      inconnu: '#000000',
      vidange: '#8B4513',
      sous_vitesse: '#FFFF00',
      nominal: '#008000',
      arret: '#87CEEB',
      futur: '#D3D3D3'
    };

    const entries = Object.entries(etatDurations).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(([key]) => key);
    const dataValues = entries.map(([, value]) => value);
    const backgroundColors = labels.map(e => colors[e] || '#808080');

    return { labels, dataValues, backgroundColors };
  }, []);

  const renderChart = useCallback((alias, jour, segs) => {
    const canvas = document.getElementById(`pie-${alias}`);
    if (!canvas || !segs) return;

    const ctx = canvas.getContext('2d');
    const { labels, dataValues, backgroundColors } = processData(jour, segs);

    window.pieChartInstances = window.pieChartInstances || {};
    if (window.pieChartInstances[alias]) {
      window.pieChartInstances[alias].destroy();
    }

    window.pieChartInstances[alias] = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: dataValues,
          backgroundColor: backgroundColors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            formatter: (value, ctx) => {
              const total = ctx.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
              return total > 0 ? Math.round((value / total) * 100) + '%' : '';
            },
            color: '#000',
            font: { size: 10, weight: 'bold' },
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 4
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }, [processData]);

  useEffect(() => {
    const handleResize = () => {
      aliases.forEach(alias => {
        if (window.pieChartInstances && window.pieChartInstances[alias]) {
          window.pieChartInstances[alias].resize();
        }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    aliases.forEach(alias => {
      if (data[alias]) {
        renderChart(alias, date, data[alias].segments);
      }
    });
  }, [data, date, renderChart]);

  const renderBar = useCallback((alias, segs) => {
    const jourDebut = new Date(`${date}T00:00:00`);
    const jourFin = new Date(`${date}T23:59:59.999`);

    const today = formatDate(new Date());
    const currentDate = new Date(`${date}T00:00:00`);
    const isToday = date === today;
    const isFuture = currentDate.getTime() > new Date(`${today}T00:00:00`).getTime();

    const sorted = (segs || []).filter(r => {
      const dateFin = new Date(r.fin);
      return dateFin >= jourDebut && dateFin <= jourFin;
    }).sort((a, b) => new Date(a.fin) - new Date(b.fin));

    const adjustedData = [];
    let lastTime = new Date(jourDebut);

    if (sorted.length === 0) {
      adjustedData.push({ debut: lastTime, fin: jourFin, etat: isFuture ? 'futur' : 'inconnu' });
    } else {
      adjustedData.push({ debut: lastTime, fin: new Date(sorted[0].fin), etat: sorted[0].etat });
      lastTime = new Date(sorted[0].fin);

      for (let i = 1; i < sorted.length; i++) {
        adjustedData.push({ debut: lastTime, fin: new Date(sorted[i].fin), etat: sorted[i - 1].etat });
        lastTime = new Date(sorted[i].fin);
      }

      const finEffective = isToday ? new Date() : jourFin;
      if (!isFuture && lastTime < finEffective) {
        adjustedData.push({ debut: lastTime, fin: finEffective, etat: sorted[sorted.length - 1].etat });
      }
      if ((isToday || isFuture) && lastTime < jourFin) {
        adjustedData.push({ debut: lastTime, fin: jourFin, etat: 'futur' });
      }
    }

    return (
      <div className="barre">
        {adjustedData.map((segment, idx) => {
          const seconds = (segment.fin - segment.debut) / 1000;
          return (
            <div
              key={idx}
              className={`segment ${segment.etat}`}
              style={{ 
                width: `${(seconds / 86400) * 100}%`
              }}
              title={`${segment.etat} (${Math.round(seconds / 60)} min)`}
            />
          );
        })}
      </div>
    );
  }, [date]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <AlertCircle size={24} className="error-icon" />
        <p>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="convoyeur-details">
      <div className="header-container">
        <div className="header">
          <div className="title-group">
            <h1>
              <Gauge className="header-icon" size={24} />
              KPI'S Débit - {date}
            </h1>
            <p className="subtitle">
              <Clock size={16} className="subtitle-icon" />
              Visualisation journalière des états de production par convoyeur
            </p>
          </div>
          <button className="pdf-button" onClick={exportPDF}>
            <Download size={18} className="button-icon" />
            Exporter PDF
          </button>
        </div>
      </div>

      <div className="convoyeurs-container">
        {aliases.map(alias => {
          const displayName = alias.replace(/^PC\.pesage\.(FLM_)?/, '');
          const convoyeurData = data[alias] || { segments: [], debit: 0 };
          return (
            <div key={alias} className="convoyeur-bloc">
              <div className="convoyeur-header">
                <h3>
                  {displayName}
                </h3>
                <div className="debit-value">
                  <span className="debit-icon">Débit :</span> 
                  {convoyeurData.debit.toFixed(1)} t/h
                </div>
              </div>
              {renderBar(alias, convoyeurData.segments)}
              <div className="chart-and-legend">
                <div className="pie-chart-container">
                  <canvas id={`pie-${alias}`}></canvas>
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-icon nominal"><Circle size={10} /></span>
                    <span className="legend-label">Nominal</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon sous_vitesse"><AlertCircle size={10} /></span>
                    <span className="legend-label">Sous-vitesse</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon arret"><Power size={10} /></span>
                    <span className="legend-label">Arrêt</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon vidange"><HelpCircle size={10} /></span>
                    <span className="legend-label">Vidange</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-icon inconnu"><HelpCircle size={10} /></span>
                    <span className="legend-label">Inconnu</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConvoyeurDetails;