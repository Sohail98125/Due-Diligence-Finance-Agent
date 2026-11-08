import enRichSchema from "../../calculations/ratio.js";
import enRichWithTrends from "../../calculations/trends.js";
import detectRedFlags from "../../calculations/redFlags.js";

const calculationNode = async (state) => {
    try {
        if (!state.schema) {
            throw new Error("Financial schema is missing");
        }
        let schema = state.schema;
        schema = enRichSchema(schema);
        schema = enRichWithTrends(schema);
        schema = detectRedFlags(schema);
        return {
            schema: schema,
            error: null
        }
    } catch (error) {
        return {
            error: error.message
        }
    }
}

export default calculationNode;