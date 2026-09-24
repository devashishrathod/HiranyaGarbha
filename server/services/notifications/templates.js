const NotificationTemplate = require("../../models/NotificationTemplate");
const { pagination } = require("../../utils");
const { throwError } = require("../../utils");

/**
 * Template CRUD.
 *
 * Grouped in one file rather than split per action: these are four plain
 * queries with no shared logic worth separating, and the one-file-per-action
 * layout is worth its overhead only where the actions have substance.
 */

exports.getAllTemplates = async (query = {}) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 50;

  const pipeline = [
    { $match: { isDeleted: false } },
    { $sort: { createdAt: -1 } },
  ];

  return pagination(NotificationTemplate, pipeline, page, limit);
};

exports.createTemplate = async (payload, adminUserId) =>
  (await NotificationTemplate.create({ ...payload, createdBy: adminUserId })).toObject();

exports.updateTemplate = async (id, payload) => {
  const template = await NotificationTemplate.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: payload },
    { new: true, runValidators: true }
  ).lean();

  if (!template) throwError(404, "Notification template not found");

  return template;
};

exports.deleteTemplate = async (id) => {
  const template = await NotificationTemplate.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  ).lean();

  if (!template) throwError(404, "Notification template not found");

  return { deleted: true };
};
