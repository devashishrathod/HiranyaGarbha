const { asyncWrapper, sendSuccess } = require("../../utils");
const { getContactUs } = require("../../services/contactUs");

exports.get = asyncWrapper(async (req, res) => {
  const result = await getContactUs(req.params?.id);
  return sendSuccess(res, 200, "Contact request fetched", result);
});
