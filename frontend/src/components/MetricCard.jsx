const MetricCard = ({ label, value, hint, tone = "neutral" }) => {
    const isEmpty = value === null || value === undefined || value === "";
    return (
        <div data-tone={tone} >
            <p>{label}</p>
            <p>{isEmpty ? "N/A" : value}</p>
            {hint && <p>{hint}</p>}
        </div>
    )
}
export default MetricCard;