// Data awal
let dataPembayaran = JSON.parse(localStorage.getItem("dataPembayaran")) || [];

// Fungsi untuk menampilkan data
function displayData() {
  const dataTable = document.getElementById("data-table");
  dataTable.innerHTML = "";
  dataPembayaran.forEach((item, index) => {
    dataTable.innerHTML += `
      <tr>
        <td>${item.id}</td>
        <td>${item.pembeli}</td>
        <td>${item.total}</td>
        <td>${item.tanggalPesan}</td>
        <td>
          <span class="badge bg-${item.status === 'Menunggu Verifikasi' ? 'warning' : item.status === 'Diterima' ? 'success' : 'danger'}">${item.status}</span>
        </td>
        <td><button class="btn btn-secondary btn-sm">Lihat Bukti</button></td>
        <td>
          <button class="btn btn-success btn-sm" onclick="updateStatus(${index}, 'Diterima')">Terima</button>
          <button class="btn btn-danger btn-sm" onclick="updateStatus(${index}, 'Ditolak')">Tolak</button>
          <button class="btn btn-info btn-sm" onclick="editData(${index})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteData(${index})">Hapus</button>
        </td>
      </tr>
    `;
  });
}

// Fungsi untuk menambah data
function addData() {
  const id = dataPembayaran.length + 1;
  const pembeli = prompt("Masukkan Nama Pembeli:");
  const total = prompt("Masukkan Total Pembayaran:");
  const tanggalPesan = prompt("Masukkan Tanggal Pesan (YYYY-MM-DD):");
  const status = "Menunggu Verifikasi";

  if (pembeli && total && tanggalPesan) {
    dataPembayaran.push({ id, pembeli, total, tanggalPesan, status });
    localStorage.setItem("dataPembayaran", JSON.stringify(dataPembayaran));
    displayData();
  } else {
    alert("Semua data harus diisi!");
  }
}

// Fungsi untuk mengubah status
function updateStatus(index, status) {
  dataPembayaran[index].status = status;
  localStorage.setItem("dataPembayaran", JSON.stringify(dataPembayaran));
  displayData();
}

// Fungsi untuk mengedit data
function editData(index) {
  const pembeli = prompt("Masukkan Nama Pembeli Baru:", dataPembayaran[index].pembeli);
  const total = prompt("Masukkan Total Baru:", dataPembayaran[index].total);
  const tanggalPesan = prompt("Masukkan Tanggal Baru (YYYY-MM-DD):", dataPembayaran[index].tanggalPesan);

  if (pembeli && total && tanggalPesan) {
    dataPembayaran[index] = { ...dataPembayaran[index], pembeli, total, tanggalPesan };
    localStorage.setItem("dataPembayaran", JSON.stringify(dataPembayaran));
    displayData();
  } else {
    alert("Semua data harus diisi!");
  }
}

// Fungsi untuk menghapus data
function deleteData(index) {
  if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
    dataPembayaran.splice(index, 1);
    localStorage.setItem("dataPembayaran", JSON.stringify(dataPembayaran));
    displayData();
  }
}

// Tampilkan data saat halaman dimuat
displayData();
