const Patient = require("../../models/Patient");
const { pagination } = require("../../utils");

exports.getAllPatients = async (query) => {
    let {
        page,
        limit,
        search,
        fullName,
        isActive,
        fromDate,
        toDate,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = query;
    page = page ? Number(page) : 1;
    limit = limit ? Number(limit) : 10;
    const match = { isDeleted: false };
    if (typeof isActive !== "undefined") {
        match.isActive = isActive === "true" || isActive === true;
    }
    if (fullName) match.fullName = { $regex: new RegExp(fullName, "i") };
    if (search) {
        match.$or = [
            { fullName: { $regex: new RegExp(search, "i") } },
            { email: { $regex: new RegExp(search, "i") } },
            { phone: { $regex: new RegExp(search, "i") } },
        ];
    }
    if (fromDate || toDate) {
        match.createdAt = {};
        if (fromDate) match.createdAt.$gte = new Date(fromDate);
        if (toDate) {
            const d = new Date(toDate);
            d.setHours(23, 59, 59, 999);
            match.createdAt.$lte = d;
        }
    }
    const pipeline = [{ $match: match }];
    const sortStage = {};
    sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;
    pipeline.push({ $sort: sortStage });
    return await pagination(Patient, pipeline, page, limit);
};
