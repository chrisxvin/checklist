<script lang="ts">
</script>

<svelte:head>
    <title>退出登录 - Preflight</title>
</svelte:head>

<div class="mx-auto w-full max-w-sm py-10">
    <div class="card bg-base-100 shadow-md">
        <div class="card-body items-center gap-4 p-8 text-center">
            <h1 class="text-xl font-bold">退出登录</h1>
            <p class="text-sm text-base-content/60">仅退出当前设备，其他设备的会话不受影响。</p>
            <form method="post">
                <button class="btn btn-error">
                    <Icon icon="mdi:logout" width="1.1em" height="1.1em" />
                    确认退出
                </button>
            </form>
            <a href="/list" class="link link-primary text-sm">返回模板库</a>
        </div>
    </div>
</div>
