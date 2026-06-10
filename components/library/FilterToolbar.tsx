'use client';

import { FILTER_TREE } from '@/lib/library/data';
import { type FilterState, EMPTY_FILTERS, isFilterActive } from '@/lib/library/filters';
import FilterDropdown from './FilterDropdown';
import TreeFilterDropdown from './TreeFilterDropdown';

interface Props {
  state: FilterState;
  onChange: (next: FilterState) => void;
}

export default function FilterToolbar({ state, onChange }: Props) {
  function update(partial: Partial<FilterState>) {
    onChange({ ...state, ...partial });
  }

  const productTree = FILTER_TREE.products.map(p => ({ parent: p.group, children: p.children }));
  const categoryTree = FILTER_TREE.categories.map(c => ({
    parent: c.category,
    children: c.subcategories,
  }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TreeFilterDropdown
        label="Products"
        tree={productTree}
        selectedParents={state.productGroups}
        selectedChildren={state.products}
        onChange={(parents, children) =>
          update({ productGroups: parents, products: children })
        }
      />
      <FilterDropdown
        label="Indication"
        options={FILTER_TREE.indications}
        selected={state.indications}
        onChange={v => update({ indications: v })}
      />
      <FilterDropdown
        label="Pub type"
        options={FILTER_TREE.pub_types}
        selected={state.pubTypes}
        onChange={v => update({ pubTypes: v })}
      />
      <FilterDropdown
        label="Study type"
        options={FILTER_TREE.study_types}
        selected={state.studyTypes}
        onChange={v => update({ studyTypes: v })}
      />
      <FilterDropdown
        label="Geography"
        options={FILTER_TREE.geographies}
        selected={state.geographies}
        onChange={v => update({ geographies: v })}
      />
      <FilterDropdown
        label="Funnel Level"
        options={FILTER_TREE.funnel_levels}
        selected={state.funnelLevels}
        onChange={v => update({ funnelLevels: v })}
      />
      <TreeFilterDropdown
        label="Category"
        tree={categoryTree}
        selectedParents={state.categoryParents}
        selectedChildren={state.categories}
        onChange={(parents, children) =>
          update({ categoryParents: parents, categories: children })
        }
      />
      {isFilterActive(state) && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="ml-1 px-2 py-1 text-xs text-serif-muted-foreground hover:text-serif-foreground hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
