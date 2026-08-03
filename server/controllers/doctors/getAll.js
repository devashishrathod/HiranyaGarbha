const {
    asyncWrapper,
    sendSuccess,
    throwError,
    cleanJoiError,
} = require("../../utils");
const { validateGetAllDoctorsQuery } = require("../../validator/doctors");
const { getAllDoctors } = require("../../services/doctors");

exports.getAll = asyncWrapper(async (req, res) => {
    const { error, value } = validateGetAllDoctorsQuery(req.query);
    if (error) throwError(422, cleanJoiError(error));
    const result = await getAllDoctors(value);
    return sendSuccess(res, 200, "Doctors fetched successfully", result);
});
