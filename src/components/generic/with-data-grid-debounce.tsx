import { GridColDef, GridEditRowsModel } from "@mui/x-data-grid";
import * as React from "react";
import { GenericDataGridRow } from "types";

/**
 * Component properties
 */
interface Props<T> {
  component: (props: DebounceProps<T>) => void;
  debounceTimeout?: number;
  columns: GridColDef[];
  rows: T[];
  onRowChange: (newRow: T) => void;
}

/**
 * Debounce properties
 */
interface DebounceProps<T> {
  columns: GridColDef[];
  rows: T[];
  onEditRowsModelChange: (editRowsModel: GridEditRowsModel) => void;
}

/**
 * With dataGrid debounce factory
 */
const WithDataGridDebounceFactory = <T extends GenericDataGridRow>() : React.FC<Props<T>> => ({
  component,
  debounceTimeout,
  columns,
  rows,
  onRowChange
}) => {
  const [ virtualizedRows, setVirtualizedRows ] = React.useState<T[]>([]);
  const [ debounceTimerIds, setDebounceTimerIds ] = React.useState<NodeJS.Timeout[]>([]);

  React.useEffect(() => {
    if (rows !== virtualizedRows) {
      setVirtualizedRows(rows);
    }
  }, [rows]);

  /**
   * Updates virtualized rows
   *
   * @param updatedVirtualizedRow updated virtualized row
   */
  const updateVirtualizedRows = (updatedVirtualizedRow: T) => {
    const updatedVirtualizedRows = virtualizedRows
      .map(virtualizedRow => (virtualizedRow.id === updatedVirtualizedRow.id ? updatedVirtualizedRow : virtualizedRow));

    setVirtualizedRows(updatedVirtualizedRows);
  };

  /**
   * Edit row model change handler
   *
   * @param editRowsModel edit row model
   */
  const onEditRowsModelChange = (editRowsModel: GridEditRowsModel) => {
    const selectedRowId = Object.keys(editRowsModel)[0];
    const rowIndex = rows.findIndex(row => row.id === selectedRowId);

    if (!selectedRowId || rowIndex >= virtualizedRows.length) {
      return;
    }

    const columnName = Object.keys(editRowsModel[selectedRowId])[0];
    const editedValue = editRowsModel[selectedRowId][columnName].value;

    const updatedVirtualizedRow: T = {
      ...virtualizedRows[rowIndex],
      [columnName]: editedValue
    };

    debounceTimerIds[rowIndex] && clearTimeout(debounceTimerIds[rowIndex]);

    const timeout = setTimeout(() => onRowChange(updatedVirtualizedRow), debounceTimeout ?? 500);

    const updatedDebounceTimerIds = [ ...debounceTimerIds ];
    updatedDebounceTimerIds.splice(rowIndex, 1, timeout);

    setDebounceTimerIds(updatedDebounceTimerIds);

    updateVirtualizedRows(updatedVirtualizedRow);
  };

  /**
   * Component render
   */
  return (
    <>
      {
        component({
          onEditRowsModelChange: onEditRowsModelChange,
          rows: virtualizedRows,
          columns: columns
        })
      }
    </>
  );
};

export default WithDataGridDebounceFactory;