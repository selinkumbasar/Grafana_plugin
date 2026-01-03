import React, {  useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css } from '@emotion/css';
import { useStyles2, useTheme2 } from '@grafana/ui';
import { PanelDataErrorView } from '@grafana/runtime';


interface Props extends PanelProps<SimpleOptions> {}

const getStyles = () => {
  return {
    wrapper: css`
      font-family: Open Sans;
      display: flex;
      flex-direction: row;   
      align-items: flex-start;   
      gap: 24px;             
      width: 100%;
      height: 100%;
    `,
    textBox: css`
      padding: 10px;
      flex: 1;  
      overflow-y: auto;  
      overflow-x: hidden;
      max-height: 100%;          
    `,
  };
};

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);

  const seriesCount = data.series.length;
  
 const [hovered, setHovered] = useState(false);
const [showValue, setShowValue] = useState(true);
const [clicks, setClicks] = useState(0);
const series = data.series[0];

const points: number[] = (() => {
  if (!series) {
    return [];
  }

  const numField = series.fields.find((f) => f.type === 'number');
  if (!numField) {
    return [];
  }

  const out: number[] = [];
  const len = numField.values.length;

  for (let i = 0; i < len; i++) {
    const raw = numField.values.get(i);
    const v = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isFinite(v)) {
      out.push(v);
    }
  }

  return out.slice(-30);
})();

const latestNumber = (() => {
  if (!series) return null;

  const numField = series.fields.find((f) => f.type === 'number');
  if (!numField) return null;

  const len = numField.values.length;
  if (len === 0) return null;

  const v = numField.values.get(len - 1);
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
})();

const ai = (() => {
  if (points.length < 8 || latestNumber == null) {
    return { trend: 'N/A', volatility: 'N/A', anomaly: false, z: 0 };
  }
  

  const n = points.length;
  const mean = points.reduce((a, b) => a + b, 0) / n;
  const variance = points.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance) || 1e-9;

  const delta = points[n - 1] - points[0];
  const trend = Math.abs(delta) < std * 0.2 ? 'flat' : delta > 0 ? 'up' : 'down';

  const cv = std / (Math.abs(mean) + 1e-9);
  const volatility = cv < 0.05 ? 'low' : cv < 0.15 ? 'medium' : 'high';

  const z = (latestNumber - mean) / std;
  const anomaly = Math.abs(z) >= 2.5;

  return { trend, volatility, anomaly, z };
})();
const circleColor = ai.anomaly
  ? theme.visualization.getColorByName('red')
  : ai.volatility === 'high'
  ? theme.visualization.getColorByName('orange')
  : ai.trend === 'up'
  ? theme.visualization.getColorByName('green')
  : ai.trend === 'down'
  ? theme.visualization.getColorByName('blue')
  : theme.visualization.getColorByName('gray');

  if (data.series.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} needsStringField />;
  }

  return (
  <div className={styles.wrapper}>
    <div className={styles.textBox}>
      
 

     <p>Show latest value: {showValue ? 'ON' : 'OFF'}</p>
{showValue && <p>Latest value: {latestNumber?.toFixed(2) ?? 'N/A'}</p>}
<p>Hovered: {hovered ? 'yes' : 'no'}</p>
<p>Clicks: {clicks}</p>
<p>Series count: {seriesCount}</p>




<p style={{ fontWeight: 600 }}>
  Developed by Selin Kumbasar – January 2026
</p>

<p>
  People say nothing is impossible, but I do nothing every day. — Winnie the Pooh
</p>

{options.aiMode && (
  <>
    <p>
      <strong>AI Insight:</strong> trend {ai.trend}, volatility {ai.volatility},{' '}
      {ai.anomaly ? `anomaly (z=${ai.z.toFixed(2)})` : 'no anomaly'}
    </p>

  
  </>
)}


      {options.showSeriesCount && (
        <div data-testid="simple-panel-series-counter">Number of series: {data.series.length}</div>
      )}
      <div>Text option value: {options.text}</div>
    </div>

 



  <div
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
 onClick={() => {
    setShowValue((v) => !v);
    setClicks((c) => c + 1);
  }}
  title="Click to toggle Latest value"
  style={{
    width: hovered ? 160 : 140,
    height: hovered ? 160 : 140,
    borderRadius: '50%',
    background: circleColor,
    flexShrink: 0,
    cursor: 'pointer',
    opacity: hovered ? 0.85 : 1,
    transition: 'width 120ms ease, height 120ms ease, opacity 120ms ease'
  }}
/>
  </div>
);};
