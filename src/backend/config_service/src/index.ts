import logger from './config/logger';
import log from './config/logs';
import app from './config/router';
const PORT = process.env.PORT || 3000;

export async function main(){
    app.listen(PORT, () => {
        logger.info(log.BOOT.BOOTING(`Server is running on port ${PORT}`, {}));
    });
}

main()