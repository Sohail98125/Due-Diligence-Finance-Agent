const RiskBadge = ({ riskLevel }) => {
    const normalized = riskLevel?.toLowerCase() ?? "unknown";

    return (
        <span data-level={normalized}>
            {riskLevel ?? "Unknown"}
        </span>
    );
};

export default RiskBadge;