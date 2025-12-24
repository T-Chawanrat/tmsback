const ExcelJS = require("exceljs");

/**
 * @param {object} res
 * @param {array|object} rows - array ของ row หรือ array ของ { sheetName, rows }
 * @param {array} columns
 * @param {string|null} sheetName
 * @param {string} fileName
 */
async function exportToExcel(res, rows, columns, sheetName = "Sheet1", fileName = "data.xlsx") {
  const workbook = new ExcelJS.Workbook();

  const headerStyle = {
    font: { bold: true, color: { argb: "FFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "465FFF" } },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const isMultiSheet = Array.isArray(rows) && rows.every((sheet) => sheet.sheetName && Array.isArray(sheet.rows));
  const sheetConfigs = isMultiSheet ? rows : [{ sheetName, rows }];

  sheetConfigs.forEach(({ sheetName, rows }) => {
    const worksheet = workbook.addWorksheet(sheetName || "Sheet");

    worksheet.columns = columns?.length
      ? columns
      : rows.length > 0
      ? Object.keys(rows[0]).map((key) => ({ header: key, key: key, width: 20 }))
      : [];

    rows.forEach((row) => {
      const rowData = { ...row };
      Object.keys(rowData).forEach((key) => {
        if (rowData[key] instanceof Date) {
          rowData[key] = rowData[key].toLocaleString("th-TH");
        }
      });
      worksheet.addRow(rowData);
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.style = headerStyle;
    });

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columns.length },
    };

    worksheet.footer = {
      oddFooter: `&L&B ${sheetName} &C&D &R&P of &N`,
    };
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { exportToExcel };