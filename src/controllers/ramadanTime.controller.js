const RamadanTime = require("../models/RamadanTime");

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

const normalizeNumber = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) ? NaN : numeric;
};

const buildDefaultRows = () => {
  const rows = [];
  for (let i = 1; i <= 30; i += 1) {
    rows.push({
      serialNo: i,
      date: `Day ${i}`,
      seheri: "TBD",
      ifter: "TBD",
    });
  }
  return rows;
};

const getOrCreateTable = async () => {
  let table = await RamadanTime.findOne();
  if (!table) {
    table = await RamadanTime.create({ rows: buildDefaultRows() });
  }
  return table;
};

const getRamadanTable = async (req, res) => {
  try {
    const table = await getOrCreateTable();

    return res.status(200).json({
      success: true,
      total: table.rows.length,
      table,
    });
  } catch (error) {
    console.error("Get Ramadan Table Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Ramadan table",
    });
  }
};

const updateRamadanTable = async (req, res) => {
  try {
    const { rows } = req.body;
    const serialNo = normalizeNumber(req.body?.serialNo);
    const date = normalizeString(req.body?.date);
    const seheri = normalizeString(req.body?.seheri);
    const ifter = normalizeString(req.body?.ifter);

    const table = await getOrCreateTable();

    if (Array.isArray(rows)) {
      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Rows array cannot be empty",
        });
      }

      const normalizedRows = rows.map((row) => {
        const rowSerial = normalizeNumber(row?.serialNo);
        const rowDate = normalizeString(row?.date);
        const rowSeheri = normalizeString(row?.seheri);
        const rowIfter = normalizeString(row?.ifter);

        if (
          rowSerial === undefined ||
          Number.isNaN(rowSerial) ||
          rowSerial < 1 ||
          !rowDate ||
          !rowSeheri ||
          !rowIfter
        ) {
          return null;
        }

        return {
          serialNo: rowSerial,
          date: rowDate,
          seheri: rowSeheri,
          ifter: rowIfter,
        };
      });

      if (normalizedRows.some((row) => row === null)) {
        return res.status(400).json({
          success: false,
          message: "Each row must include serialNo, date, seheri, and ifter",
        });
      }

      table.rows = normalizedRows;
      await table.save();

      return res.status(200).json({
        success: true,
        message: "Ramadan table updated successfully",
        table,
      });
    }

    if (serialNo === undefined || Number.isNaN(serialNo) || serialNo < 1) {
      return res.status(400).json({
        success: false,
        message: "serialNo is required to update a row",
      });
    }

    if (date === undefined && seheri === undefined && ifter === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const row = table.rows.find((item) => item.serialNo === serialNo);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Row not found",
      });
    }

    if (date !== undefined) {
      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Date cannot be empty",
        });
      }
      row.date = date;
    }

    if (seheri !== undefined) {
      if (!seheri) {
        return res.status(400).json({
          success: false,
          message: "Seheri cannot be empty",
        });
      }
      row.seheri = seheri;
    }

    if (ifter !== undefined) {
      if (!ifter) {
        return res.status(400).json({
          success: false,
          message: "Ifter cannot be empty",
        });
      }
      row.ifter = ifter;
    }

    await table.save();

    return res.status(200).json({
      success: true,
      message: "Ramadan row updated successfully",
      table,
    });
  } catch (error) {
    console.error("Update Ramadan Table Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update Ramadan table",
    });
  }
};

module.exports = {
  getRamadanTable,
  updateRamadanTable,
};
