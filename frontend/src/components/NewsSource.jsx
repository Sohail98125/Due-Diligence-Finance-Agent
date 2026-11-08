const NewsSource = ({ newsSources = [] }) => {
    if (newsSources.length === 0) return <p>No news available</p>

    return (
        <ul>
            {newsSources.map((item) => (
                <li key={item.url || item._id}>
                    <a href={item.url} target="_blank" rel="noreferrer">
                        {item.title}
                    </a>
                </li>
            ))}
        </ul>
    )
}
export default NewsSource;