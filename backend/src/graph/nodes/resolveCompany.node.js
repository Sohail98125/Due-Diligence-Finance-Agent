import Company from '../../models/company.model.js';
import { resolveTicker } from '../../services/roic.service.js';

// Escape special regex characters in the company name
const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveCompanyNode = async (state) => {
    const companyName = typeof state.companyName === "string"
        ? state.companyName.trim()
        : "";

    if (!companyName) {
        return {
            symbol: null,
            isIndian: null,
            schema: null,
            error: "Company name is missing"
        };
    }

    const exactName = new RegExp(`^${escapeRegex(companyName)}$`, "i");

    // Pehle Indian companies mein dhundo (naam, alias ya symbol se)
    const indianMatch = await Company.findOne({
        $or: [
            { company_name: exactName },
            { aliases: exactName },
            { symbol: exactName }
        ]
    }).lean();

    if (indianMatch) {
        return {
            companyName: indianMatch.company_name,
            symbol: indianMatch.symbol,
            isIndian: true,
            schema: indianMatch,
            error: null
        };
    }

    // Indian nahi mili: global company, ROIC se naam/ticker ka symbol nikalo
    try {
        const match = await resolveTicker(companyName);
        if (!match) {
            return {
                symbol: null,
                isIndian: false,
                schema: null,
                error: `Couldn't find a listed company matching "${companyName}".`
            };
        }

        return {
            companyName: match.name,
            symbol: match.symbol,
            isIndian: false,
            schema: null,
            error: null
        };
    } catch (error) {
        return {
            symbol: null,
            isIndian: false,
            schema: null,
            error: `Ticker lookup failed: ${error.message}`
        };
    }
};

export default resolveCompanyNode;