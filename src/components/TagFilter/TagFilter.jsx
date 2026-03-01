import React, { useState, useEffect } from 'react';
import styles from './TagFilter.module.css';
import useTags from '../../hooks/useTags';

const TagFilter = ({ service_name, selectedTags, onChange }) => {
    const { tags, loading } = useTags(service_name);
    const [localSelection, setLocalSelection] = useState(selectedTags || {});

    useEffect(() => {
        setLocalSelection(selectedTags || {});
    }, [selectedTags]);

    const handleTagChange = (tagKey, value) => {
        const newSelection = { ...localSelection };

        if (value === '') {
            delete newSelection[tagKey];
        } else {
            newSelection[tagKey] = value;
        }

        setLocalSelection(newSelection);
        if (onChange) {
            onChange(newSelection);
        }
    };

    const clearAll = () => {
        setLocalSelection({});
        if (onChange) {
            onChange({});
        }
    };

    const tagKeys = Object.keys(tags);

    if (tagKeys.length === 0 && !loading) {
        return null;
    }

    return (
        <div className={styles.tagFilter}>
            <div className={styles.header}>
                <h3>🏷️ Фильтр по тегам</h3>
                {Object.keys(localSelection).length > 0 && (
                    <button className={styles.clearBtn} onClick={clearAll}>
                        Очистить ({Object.keys(localSelection).length})
                    </button>
                )}
            </div>

            {loading ? (
                <div className={styles.loading}>Загрузка тегов...</div>
            ) : (
                <div className={styles.tagsGrid}>
                    {tagKeys.map((tagKey) => (
                        <div key={tagKey} className={styles.tagGroup}>
                            <label className={styles.tagLabel}>{tagKey}</label>
                            <select
                                className={styles.tagSelect}
                                value={localSelection[tagKey] || ''}
                                onChange={(e) => handleTagChange(tagKey, e.target.value)}
                            >
                                <option value="">— Все —</option>
                                {tags[tagKey].map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}

            {Object.keys(localSelection).length > 0 && (
                <div className={styles.selectedTags}>
                    <span className={styles.selectedLabel}>Выбрано:</span>
                    {Object.entries(localSelection).map(([key, value]) => (
                        <span key={key} className={styles.selectedTag}>
              <strong>{key}</strong>: {value}
                            <button
                                className={styles.removeTag}
                                onClick={() => handleTagChange(key, '')}
                            >
                ×
              </button>
            </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagFilter;