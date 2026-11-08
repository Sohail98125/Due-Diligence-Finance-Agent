const RedFlagList = ({ redFlags = [] }) => {
    if (redFlags.length === 0) return <p>No red flag Detected.</p>

    return (
        <div>
            <h3>Financial Red Flags</h3>

            <ul>
                {redFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                ))}
            </ul>
        </div>
    )
}
export default RedFlagList;