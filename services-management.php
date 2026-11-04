<?php
require_once __DIR__ . '/layout.php';
$a = page_start('admin', 'Services Management', 'services');

$edit = isset($_GET['edit']) ? q_one('SELECT * FROM services WHERE id = ?', [(int)$_GET['edit']]) : null;
$rows = q_all('SELECT * FROM services ORDER BY id');
?>
<section class="panel">
    <div class="panel-head"><h3><?= $edit ? 'Edit service' : 'Add a service' ?></h3><?php if ($edit): ?><a href="services-management.php">Cancel</a><?php endif; ?></div>
    <form method="post" action="actions.php" class="form">
        <?= csrf_input() ?><input type="hidden" name="back" value="services-management.php"><input type="hidden" name="action" value="service_save">
        <?php if ($edit): ?><input type="hidden" name="id" value="<?= (int)$edit['id'] ?>"><?php endif; ?>
        <div class="grid-2">
            <label class="field"><span>Service name</span><input type="text" name="service_name" value="<?= e($edit['service_name'] ?? '') ?>" required maxlength="100"></label>
            <label class="field"><span>Status</span><select name="status"><option value="active" <?= ($edit['status'] ?? 'active') === 'active' ? 'selected' : '' ?>>Active</option><option value="inactive" <?= ($edit['status'] ?? '') === 'inactive' ? 'selected' : '' ?>>Inactive</option></select></label>
        </div>
        <label class="field"><span>Description</span><textarea name="description" rows="3" required maxlength="500"><?= e($edit['description'] ?? '') ?></textarea></label>
        <div class="form-actions"><button class="btn btn-primary" type="submit"><?= $edit ? 'Save service' : 'Add service' ?></button></div>
    </form>
</section>

<section class="panel">
    <div class="panel-head"><h3>Services (<?= count($rows) ?>)</h3></div>
    <?php if (!$rows): ?><p class="empty">No services yet.</p><?php else: ?>
    <div class="table-wrap"><table class="table">
        <thead><tr><th>Service</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
        <?php foreach ($rows as $r): ?>
            <tr>
                <td><strong><?= e($r['service_name']) ?></strong></td>
                <td><?= e($r['description']) ?></td>
                <td><?= badge($r['status']) ?></td>
                <td class="actions">
                    <a class="btn btn-sm btn-outline" href="services-management.php?edit=<?= (int)$r['id'] ?>">Edit</a>
                    <form method="post" action="actions.php" class="inline"><?= csrf_input() ?><input type="hidden" name="back" value="services-management.php"><input type="hidden" name="action" value="service_toggle"><input type="hidden" name="id" value="<?= (int)$r['id'] ?>"><button class="btn btn-sm btn-outline"><?= $r['status'] === 'active' ? 'Deactivate' : 'Activate' ?></button></form>
                    <form method="post" action="actions.php" class="inline"><?= csrf_input() ?><input type="hidden" name="back" value="services-management.php"><input type="hidden" name="action" value="service_delete"><input type="hidden" name="id" value="<?= (int)$r['id'] ?>"><button class="btn btn-sm btn-danger" data-confirm="Delete this service?">Delete</button></form>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table></div>
    <?php endif; ?>
</section>
<?php page_end('admin');
