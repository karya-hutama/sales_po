/**
 * Google Apps Script for Sales & PO Management System
 * Updated with Debug Info
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'getData':
        return jsonResponse({
          users: getSheetData('User'),
          products: getSheetData('Product'),
          customers: getSheetData('Customer'),
          routes: getSheetData('Rute'),
          pos: getSheetData('Daftar_PO')
        });
      case 'checkSetup':
        return jsonResponse({
          spreadsheetName: SS.getName(),
          sheets: SS.getSheets().map(s => s.getName()),
          userCount: getSheetData('User').length
        });
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ error: 'Body bukan JSON valid: ' + err.message }, 400);
  }

  const action = data.action || '';
  
  try {
    switch (action.toLowerCase()) {
      case 'login':
        return handleLogin(data);
      case 'createpo':
        return handleCreatePO(data);
      case 'updatepo':
        return handleUpdatePO(data);
      case 'deletepo':
        return handleDeletePO(data);
      case 'processpo':
        return handleProcessPO(data);
      case 'createcustomer':
        return handleCreateCustomer(data);
      case 'updatecustomer':
        return handleUpdateCustomer(data);
      case 'deletecustomer':
        return handleDeleteCustomer(data);
      default:
        return jsonResponse({ 
          error: 'Perintah (action) "' + action + '" tidak dikenal.', 
          receivedData: data 
        }, 400);
    }
  } catch (err) {
    return jsonResponse({ error: 'Script Error: ' + err.message }, 500);
  }
}

function getSheetData(sheetName) {
  const sheet = SS.getSheetByName(sheetName);
  if (!sheet) return [];
  const range = sheet.getDataRange();
  if (!range) return [];
  const entries = range.getValues();
  if (entries.length <= 1) return [];
  
  const headers = entries[0].map(h => String(h).trim().toLowerCase());
  const data = entries.slice(1);
  
  return data.map((row, index) => {
    const obj = { id_row: index + 2 };
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

function handleLogin(data) {
  const sheetName = 'User';
  const users = getSheetData(sheetName);
  
  if (users.length === 0) {
    const sheet = SS.getSheetByName(sheetName);
    if (!sheet) {
      return jsonResponse({ success: false, message: 'EROR: Tab Sheet "User" tidak ditemukan di Google Sheets Anda.' }, 404);
    }
    return jsonResponse({ success: false, message: 'EROR: Sheet "User" ditemukan tetapi tidak ada data (masih kosong).' }, 400);
  }

  const inputUser = String(data.username || '').trim().toLowerCase();
  const inputPass = String(data.password || '').trim();

  const user = users.find(u => {
    const sUser = String(u.username || '').trim().toLowerCase();
    const sPass = String(u.password || '').trim();
    return sUser === inputUser && sPass === inputPass;
  });

  if (user) {
    return jsonResponse({ 
      success: true, 
      user: { 
        id_user: user.id_user || 'N/A', 
        username: user.username, 
        level: user.level || 'Sales' 
      } 
    });
  }
  
  return jsonResponse({ 
    success: false, 
    message: 'LOGIN GAGAL: Username atau Password tidak cocok dengan data di Google Sheets. Periksa ejaan dan spasi.' 
  }, 401);
}

function handleCreatePO(data) {
  const sheet = SS.getSheetByName('Daftar_PO');
  const poId = 'PO-' + new Date().getTime();
  data.items.forEach(item => {
    sheet.appendRow([
      data.tanggal_po,
      data.id_sales,
      data.id_customer,
      item.product,
      item.qty,
      data.id_rute,
      'Belum Diproses',
      0,
      poId
    ]);
  });
  return jsonResponse({ success: true, poId: poId });
}

function handleUpdatePO(data) {
  const sheet = SS.getSheetByName('Daftar_PO');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowIdx = data.id_row;
  
  const colMap = {};
  headers.forEach((h, i) => colMap[h.trim().toLowerCase()] = i + 1);
  
  if (colMap['tanggal_po']) sheet.getRange(rowIdx, colMap['tanggal_po']).setValue(data.tanggal_po);
  if (colMap['id_customer']) sheet.getRange(rowIdx, colMap['id_customer']).setValue(data.id_customer);
  if (colMap['product']) sheet.getRange(rowIdx, colMap['product']).setValue(data.product);
  if (colMap['qty']) sheet.getRange(rowIdx, colMap['qty']).setValue(data.qty);
  if (colMap['id_rute']) sheet.getRange(rowIdx, colMap['id_rute']).setValue(data.id_rute);
  
  return jsonResponse({ success: true });
}

function handleDeletePO(data) {
  const sheet = SS.getSheetByName('Daftar_PO');
  sheet.deleteRow(data.id_row);
  return jsonResponse({ success: true });
}

function handleProcessPO(data) {
  const sheet = SS.getSheetByName('Daftar_PO');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowIdx = data.id_row;
  
  const colMap = {};
  headers.forEach((h, i) => colMap[h.trim().toLowerCase()] = i + 1);
  
  if (colMap['status_po']) sheet.getRange(rowIdx, colMap['status_po']).setValue('Sudah Diproses');
  if (colMap['qty_realisasi']) sheet.getRange(rowIdx, colMap['qty_realisasi']).setValue(data.qty_realisasi);
  
  return jsonResponse({ success: true });
}

function handleCreateCustomer(data) {
  const sheet = SS.getSheetByName('Customer');
  const id = 'CUST-' + new Date().getTime();
  sheet.appendRow([
    id,
    data.nama_customer,
    data.whatsapp_customer,
    data.alamat
  ]);
  return jsonResponse({ success: true, id: id });
}

function handleUpdateCustomer(data) {
  const sheet = SS.getSheetByName('Customer');
  const rows = sheet.getDataRange().getValues();
  const idToFind = data.id_customer;
  
  let targetRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] == idToFind) {
      targetRow = i + 1;
      break;
    }
  }
  
  if (targetRow > 0) {
    sheet.getRange(targetRow, 2).setValue(data.nama_customer);
    sheet.getRange(targetRow, 3).setValue(data.whatsapp_customer);
    sheet.getRange(targetRow, 4).setValue(data.alamat);
    return jsonResponse({ success: true });
  }
  return jsonResponse({ success: false, message: 'Customer not found' }, 404);
}

function handleDeleteCustomer(data) {
  const sheet = SS.getSheetByName('Customer');
  if (data.id_row) {
    sheet.deleteRow(data.id_row);
    return jsonResponse({ success: true });
  }
  
  // Fallback to searching by ID if id_row is not provided
  const rows = sheet.getDataRange().getValues();
  const idToFind = data.id_customer;
  
  let targetRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() == String(idToFind).trim()) {
      targetRow = i + 1;
      break;
    }
  }
  
  if (targetRow > 0) {
    sheet.deleteRow(targetRow);
    return jsonResponse({ success: true });
  }
  return jsonResponse({ success: false, message: 'Customer not found' }, 404);
}

function jsonResponse(data, code = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
