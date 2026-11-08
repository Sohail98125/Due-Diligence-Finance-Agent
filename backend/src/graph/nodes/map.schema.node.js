import mapToSchema from '../../services/schemaMapper.service.js';

const mapSchemaNode = async(state)=>{
    try{
        // raw finanical data ko schema mein convert karne ke liye 
        
        if(!state.rawFinanceData){
            return{
                error:"No finanical data available to map "
            }
        }
        const schema = mapToSchema(state.rawFinanceData);
        return {
            schema,
            error:null
        }
    }catch(error){
        return{
            schema:null,
            error:error.message
        }
    }
}
export default mapSchemaNode;