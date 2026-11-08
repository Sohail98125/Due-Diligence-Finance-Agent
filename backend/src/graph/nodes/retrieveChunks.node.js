import retrieverCompanyContext from '../../rag/retriever.js';

const retrieverChunkNode = async(state)=>{
    try{
        const docs = await retrieverCompanyContext(state.companyName);
        const ragContext = docs.map(d=>d.pageContent).join("\n\n--\n\n");
        return {
            ragContext,
            error:null
        }
    }catch(error){
        return{
            ragContext:null,
            error:error.message
        }
    }
}
export default retrieverChunkNode;