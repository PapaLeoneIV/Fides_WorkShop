import app from './config/router';
const PORT = process.env.PORT || 3000;

export async function main(){
    app.listen(PORT, () => {
        logger.info("[CONFIG SERVICE] Server Listening for config request on PORT:", PORT);
    });
}

main()