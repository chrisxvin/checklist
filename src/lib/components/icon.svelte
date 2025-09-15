<script lang="ts">
import Iconify from "@iconify/svelte";

interface IProps {
    icon: string;
    width?: any;
    height?: any;
    children?: any;
    [key: string]: unknown;
}
let { children = undefined, width = undefined, height = undefined, ...rest }: IProps = $props();
let actualWidth = $derived(width ?? height ?? "1rem");
let actualHeight = $derived(height ?? width ?? "1rem");
</script>

{#snippet icon()}
    <span style="display: inline-flex; width: {actualWidth}; height: {actualHeight};">
        <Iconify inline={true} width={actualWidth} height={actualHeight} {...rest} />
    </span>
{/snippet}

{#if children}
    <span class="inline-flex items-center">
        {@render icon()}
        {@render children?.()}
    </span>
{:else}
    {@render icon()}
{/if}
