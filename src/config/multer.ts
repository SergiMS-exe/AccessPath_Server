import multer from 'multer';

const storage = multer.memoryStorage(); // Almacena el archivo en memoria
const upload = multer({ storage: storage });

export default upload;
