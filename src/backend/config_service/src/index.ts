import app from './config/router';
const PORT = process.env.PORT || 3000;

export async function main(){
    app.listen(PORT, () => {
        console.log("Server Listening on PORT:", PORT);
    });
}

main()