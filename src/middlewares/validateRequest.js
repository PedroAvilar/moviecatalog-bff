import AppError from "../utils/AppError.js";

const validateRequest = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        const errorMessage = error.issues?.[0]?.message || 'Dados inválidos';
        next(new AppError(errorMessage, 400));
    }
};

export default validateRequest;